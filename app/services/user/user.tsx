'use server';
import {Prisma, PrismaClient} from "@prisma/client";
import {UserDto} from "@/app/interface/user/userDto";
import bcrypt from 'bcrypt';
import {UserRegisterDto} from "@/app/interface/user/useRegisterDto";
import {verifyAuth} from "@/app/core/verifyAuth";


const prisma = new PrismaClient();
export type UserWithAdress = Prisma.UserGetPayload<{
    include: { addresses: true }
}>;


export async function getUserById(id: string): Promise<UserWithAdress | null> {

    try {

        const authPayload = await verifyAuth();
        console.log(authPayload)

        return await prisma.user.findUnique({
            where: {id},
            include: {addresses: true}
        });

    } catch (e) {
        throw new Error(`La récupération de l'utilisateur a échoué`);
    }

}

export async function updateUser(user: UserDto) {
    if (!user.id) {
        throw new Error(`L'ID de l'utilisateur est requis pour la mise à jour.`);
    }

    try {
        const updatedUser: UserDto = await prisma.user.update({
            where: {
                id: user.id,
            },

            data: {
                name: user.name,
            },
            include: {
                addresses: true,
            },
        });

        const userDto: UserDto = {
            id: updatedUser.id || undefined,
            name: updatedUser.name,
            email: updatedUser.email,
            emailVerified: updatedUser.emailVerified,
            image: updatedUser.image,
            addresses: updatedUser.addresses || [],
        };
        return userDto

    } catch (e) {
        throw new Error(`La mise à jour de l'utilisateur a échouée`);
    }


}


export async function createUser(email: string, name: string, password: string): Promise<UserRegisterDto> {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        const userDto: UserRegisterDto = {
            id: user.id,
            name: user.name,
            email: user.email,
            password: '',
            emailVerified: user.emailVerified,
            image: user.image,
        };

        return userDto;
    } catch (error) {
        throw new Error("Erreur lors de la création de l'utilisateur.");
    }
}