'use server'
import {prisma} from "@/lib/db";
import {CartDto} from "@/app/interface/cart/cartDto";
import {CartItemDto, CartItemDtoWithoutProduct} from "@/app/interface/cart/cart-item.dto";
import {ProductDto} from "@/app/interface/product/productDto";
import {verifyAuth} from "@/app/core/verifyAuth";

export async function getTotalLengthItemsCart(userId: string): Promise<number> {
    const verify = await verifyAuth(["USER", "ADMIN"]);
    if (verify && verify.user.id === userId) {
        const allItems: CartItemDtoWithoutProduct[] = await prisma.cartItem.findMany({
            where: {
                product: {},
                cart: {
                    userId: userId,
                    isConvertedToOrder: false
                },
            },
        });

        return allItems.reduce((acc: number, item: CartItemDtoWithoutProduct) => {
            if (item.quantity > 0) {
                acc += item.quantity;
            }
            return acc;
        }, 0);
    }
    return 0
}

export async function getClientCart(userId: string): Promise<CartDto | null> {
    let cart: CartDto | null = await prisma.cart.findFirst({
        where: {
            userId,
            isConvertedToOrder: false
        },
        include: {
            cartItems: {
                include: {
                    product: {
                        include: {
                            discount: true
                        }
                    },
                    cart: false,
                },
            },
            user: true
        },

    });

    if (cart && cart.id) {
        const isSameTotalPrice: boolean = await checkIfTotalCartEqualTotalProductPrice(cart)
        console.log(isSameTotalPrice)
        if (!isSameTotalPrice) {
            cart = await updatePriceItemCartAndCart(cart)
        }
    }

    return cart
}

async function updatePriceItemCartAndCart(cart: CartDto): Promise<CartDto | null> {

    if (cart && cart.id && cart.cartItems.length > 0) {
        for (const cartItem of cart.cartItems) {
            const price: number = calculPriceForOneItemCart(cartItem)
            if (price !== cartItem.totalPrice) {
                await prisma.cartItem.update({
                    where: {id: cartItem.id},
                    data: {
                        quantity: cartItem.quantity,
                        totalPrice: price
                    },
                    include: {
                        product: {
                            include: {
                                discount: true
                            }
                        }
                    }
                })
            }
        }
        cart = await updateTotalCartPrice(cart.id, cart.cartItems)

    }
    return cart
}

export async function createItemCartIfUserHaveCart(product: ProductDto, clientCartId: string, quantity: number): Promise<CartDto> {
    if (!product.id) {
        throw new Error(`product doesn't exist`);
    }

    let totalPriceItem: number = 0;
    if (product) {
        totalPriceItem += product.price * quantity
        totalPriceItem -= product.discount ? (totalPriceItem * product.discount.rate) / 100 : 0
    }


    await prisma.cartItem.create({
        data: {
            quantity: quantity,
            totalPrice: totalPriceItem,
            productId: product.id,
            cartId: clientCartId
        },
        include: {
            product: {
                include: {
                    discount: true
                }
            }
        }
    });
    return updateTotalCartPrice(clientCartId);
}

export async function updateItemCart(cartItemId: string | undefined, quantity: number, deleteItem: boolean = false): Promise<CartDto> {
    if (!cartItemId) {
        throw Error(`cartItemId can't be undefined`)
    }

    let itemTotalPrice: number = 0

    const cartItem: CartItemDto | null = await prisma.cartItem.findFirst({
        where: {
            id: cartItemId
        },
        include: {
            product: {
                include: {
                    discount: true
                }
            }
        }
    })

    if (!cartItem) {
        throw Error('produit non trouvé')
    }

    if (!cartItem.cartId) {
        throw Error('cart non trouvé')
    }
    cartItem.quantity = quantity;

    if (cartItem.product) {
        itemTotalPrice = calculPriceForOneItemCart(cartItem)
    }

    if (deleteItem) {
        await prisma.cartItem.delete({
            where: {
                id: cartItem.id
            }
        })
    } else {
        await prisma.cartItem.update({
            where: {id: cartItem.id},
            data: {
                quantity: cartItem.quantity,
                totalPrice: itemTotalPrice,
            },
            include: {
                product: {
                    include: {
                        discount: true
                    }
                }
            }
        })
    }
    return updateTotalCartPrice(cartItem.cartId);

}

export async function createCart(product: ProductDto, userId: string): Promise<CartDto> {
    let itemTotalPrice: number = 0

    if (product) {
        itemTotalPrice = product.price;
        itemTotalPrice -= product.discount ? (itemTotalPrice * product.discount.rate) / 100 : 0
    }

    if (!product.id) {
        throw new Error(`product don't exist`)
    }
    return prisma.cart.create({
        data: {
            creationDate: new Date(),
            updatedAt: new Date(),
            userId,
            isConvertedToOrder: false,
            totalPrice: itemTotalPrice,
            cartItems: {
                create: [
                    {
                        quantity: 1,
                        totalPrice: itemTotalPrice,
                        productId: product.id,
                    },
                ],
            },
        },
        include: {
            cartItems: {
                include: {
                    product: {
                        include: {
                            discount: true
                        }
                    }
                }
            },
        },
    });
}

export async function updateTotalCartPrice(cartId: string, cartItems: CartItemDto[] | null = null): Promise<CartDto> {
    let allUserItemCart: CartItemDto[]
    if (cartItems !== null) {
        allUserItemCart = cartItems
    } else {
        allUserItemCart = await prisma.cartItem.findMany({
            where: {
                cartId
            },
            include: {
                product: {
                    include: {
                        discount: true
                    }
                }
            }
        })
    }

    const totalPrice: number = allUserItemCart.reduce((acc: number, item: CartItemDto) => {
        if (item.quantity > 0) {
            acc += item.totalPrice;
        }
        return acc;
    }, 0);

    return prisma.cart.update({
        where: {id: cartId},
        data: {
            totalPrice,
            updatedAt: new Date()
        },
        include: {
            cartItems: {
                include: {
                    product: {
                        include: {
                            discount: true
                        }
                    }
                }
            }
        }
    });
}

async function checkIfTotalCartEqualTotalProductPrice(cart: CartDto): Promise<boolean> {
    const totalCart: number = cart.totalPrice;
    const totalProduct: number = cart.cartItems.reduce((acc: number, item: CartItemDto) => {
        if (item.quantity > 0) {
            acc += calculPriceForOneItemCart(item)
        }
        return acc;
    }, 0);
    return totalCart === totalProduct;
}

function calculPriceForOneItemCart(item: CartItemDto): number {
    let itemTotalPrice: number = item.product.price * item.quantity;
    itemTotalPrice -= item.product.discount ? (itemTotalPrice * item.product.discount.rate) / 100 : 0
    return itemTotalPrice
}