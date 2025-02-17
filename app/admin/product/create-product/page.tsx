"use client";
import React, { useState, useEffect, useRef, useContext } from 'react';
import {getAllCategories} from '@/app/services/category/category';
import {createProduct} from '@/app/services/products/product';
import {CategoryDto} from '@/app/interface/category/categoryDto';
import {uploadImage} from '@/lib/uploadImage';
import DragAndDrop from "@/app/components/dragAndDrop/dragAndDrop";
import ImagePreview from "@/app/components/imagePreview/imagePreview";
import RoundedButton from "@/app/components/ui/rounded-button";
import {getPageName} from "@/app/utils/utils";
import {ProductDto} from "@/app/interface/product/productDto";
import { ToastContext } from '@provider/toastProvider';

export default function CreateProductPage({ searchParams }) {
    const {show} = useContext(ToastContext)
    const courseName = searchParams.name;

    const [product, setProduct] = useState({
        name: courseName || '',
        slug: '',
        description: '',
        stock:0,
        image: '',
        price: 0,
        categoryId: '',
        discountId: null
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getAllCategories();
                setCategories(fetchedCategories);
            } catch (err: unknown) {
                if (err instanceof Error) {
                   show('Erreur', 'Erreur lors du chargement des catégories','error')
                }
            } finally {
                setLoadingCategories(false);
            }
        };
        getPageName();
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setProduct((prevProduct) => ({
            ...prevProduct,
            [name]: value,
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);


        try {
            let imagePath: string = '';
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                imagePath = await uploadImage(formData);
            }
            const productFormatted: number = product.price * 100
            const productWithImage: ProductDto = {...product, image: imagePath, price: productFormatted};
            await createProduct(productWithImage);
            show('Création de produit', `Le produit ${product.name} a bien été créer`,'success')
            setProduct({
                name: '',
                slug: '',
                description: '',
                image: '',
                price: 0,
                stock:0,
                categoryId: '',
                discountId: null
            });
            setImageFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                show('Erreur', 'Erreur lors de la création des produits','error')

            }
        } finally {
            setLoading(false);
        }
    };

    const deleteImage = () => {
        setImageFile(null)
    }

    const handleImage = (image: File) => {
        if (image) {
            setImageFile(image);
        } else {
            setImageFile(null);
        }
    };

    return (
        <div className="bg-primaryBackgroundColor min-h-screen">
            <div className="p-5 bg-primaryBackgroundColor">
                <h1 className="text-2xl mb-5">Créer un Produit</h1>
                {loadingCategories ? (
                    <p>Chargement du formulaire...</p>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-3/6 max-w-xl p-6 mr-12 bg-white shadow-md rounded-md">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex justify-between">
                                    <div>
                                        <label>Nom</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="w-60 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-actionColor sm:text-sm"
                                            value={product.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label>Slug</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={product.slug}
                                            onChange={handleChange}
                                            className="w-60 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-actionColor sm:text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <label>Prix</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={product.price}
                                            onChange={handleChange}
                                            className="block w-60 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-actionColor sm:text-sm"
                                            required
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label>Catégorie</label>
                                        <select
                                            name="categoryId"
                                            value={product.categoryId}
                                            onChange={handleChange}
                                            className="block w-60 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-actionColor sm:text-sm"
                                            required
                                        >
                                            <option value="">Sélectionnez une catégorie</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                </div>
                                <div>
                                    <label>Stock</label>
                                    <input
                                      type="number"
                                      name="stock"
                                      value={product.stock}
                                      onChange={handleChange}
                                      className="block w-60 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-actionColor sm:text-sm"
                                      required
                                      step="0.01"
                                      min="0"
                                    />
                                </div>
                                <div>
                                    <label>Description</label>
                                    <textarea
                                      name="description"
                                      value={product.description}
                                      className="w-full h-32 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-actionColor sm:text-sm"
                                      onChange={handleChange}
                                      required
                                    />
                                </div>

                                {imageFile ? (
                                  <div className='flex items-center justify-center'>
                                        <ImagePreview file={imageFile}></ImagePreview>
                                        <RoundedButton onClickAction={() => deleteImage()} message="Supprimer" positionIcon="right" icon='delete' classes="tomato"/>
                                    </div>

                                ) : (<DragAndDrop onDrop={handleImage}></DragAndDrop>)}


                                <button type="submit" disabled={loading}
                                        className="w-full py-2 px-4 bg-actionColor transition ease-in-out delay-150 hover:bg-darkActionColor text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    {loading ? 'Création en cours...' : 'Créer le produit'}
                                </button>
                            </form>
                        </div>
                    </div>

                )}
            </div>
        </div>

    );
}
