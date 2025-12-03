import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    ResetPassword: undefined;
};

export type MainTabParamList = {
    Home: { openDrinkLogId?: string } | undefined;
    Explore: undefined;
    Add: { prefilledCocktailId?: string; prefilledCocktailName?: string; prefilledCocktailImageUrl?: string } | undefined;
    Social: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    UserProfile: { userId: string };
    Settings: undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}