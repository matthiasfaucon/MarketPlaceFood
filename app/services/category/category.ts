'use server';

import {PrismaClient} from '@prisma/client';
import {Category} from '@/app/interface/category/category';

const prisma = new PrismaClient();


// Function pour créer une category
export async function createCategory(category: Category) {
    if (!category.name || category.name.trim() === '') {
        throw new Error('Le nom de la catégorie est requis et doit être une chaîne de caractères non vide.');
    }

    try {
        const newCategory: Category = await prisma.category.create({
            data: {
                name: category.name,
            },
        });
        return newCategory;
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new Error('Une catégorie avec ce nom existe déjà.');
        }
        throw new Error('La création de la catégorie a échoué');
    }
}

// Function pour recupérer toutes les categories 
export async function getAllCategories() {
    try {
        return await prisma.category.findMany();

    } catch (error) {
        throw new Error('La récupération des catégories a échoué');
    }
}