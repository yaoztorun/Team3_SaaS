import { Tables } from './supabase';

// JSON field types for Cocktail table
export interface Ingredient {
        name: string;
        amount: number;
        unit: string;
}

export interface InstructionStep {
        step: number;
        description: string;
}

// Base Cocktail type from database
export type CocktailRow = Tables<'Cocktail'>;

// Application Cocktail type with properly typed JSON fields
export type Cocktail = Omit<CocktailRow, 'ingredients' | 'instructions' | 'difficulty' | 'origin_type'> & {
        ingredients: Ingredient[];
        instructions: InstructionStep[];
        difficulty: 'easy' | 'medium' | 'hard';
        origin_type: 'system' | 'user' | null;
};
