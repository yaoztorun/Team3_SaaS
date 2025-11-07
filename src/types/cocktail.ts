export interface Ingredient {
        name: string;
        amount: number;
        unit: string;
}

export interface InstructionStep {
        step: number;
        description: string;
}

export interface Cocktail {
        id: string; // uuid
        created_at: string;
        name: string | null;
        ingredients: Ingredient[];
        instructions: InstructionStep[];
        is_public: boolean | null;
        image_url: string | null;
        creator_id: string | null;
        origin_type?: string | null;
}
