import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Heading } from '@/src/components/global';
import { useNavigation } from '@react-navigation/native';

export const PrivacyPolicy: React.FC = () => {
    const navigation = useNavigation();

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar 
                title="Privacy Policy" 
                showBack 
                onBackPress={() => navigation.goBack()}
                hideStats
            />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                <Box className="bg-white rounded-2xl p-6">
                    <Text className="text-sm text-neutral-500 mb-4">
                        Last Updated: December 10, 2025
                    </Text>

                    <Text className="text-sm text-neutral-700 mb-4">
                        At Sippin, we take your privacy seriously. This Privacy Policy explains how we collect, use, and 
                        protect your personal information when you use our App.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        1. Information We Collect
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-2">
                        We collect the following types of information:
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • <Text className="font-semibold">Account Information:</Text> Email address, name, profile picture, and 
                        authentication credentials when you create an account
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • <Text className="font-semibold">User Content:</Text> Cocktail recipes, photos, ratings, reviews, and 
                        comments you post on the App
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • <Text className="font-semibold">Usage Data:</Text> Information about how you interact with the App, 
                        including features used and time spent
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-4 ml-4">
                        • <Text className="font-semibold">Device Information:</Text> Device type, operating system, and browser 
                        information
                    </Text>

                    <Heading level="h3" className="mb-3">
                        2. How We Use Your Information
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-2">
                        We use your information to:
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Provide and improve the App's functionality
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Personalize your experience and show relevant cocktail recommendations
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Enable social features like friend connections and event invitations
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Send notifications about likes, comments, and friend requests (if enabled)
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-4 ml-4">
                        • Analyze usage patterns to improve our services
                    </Text>

                    <Heading level="h3" className="mb-3">
                        3. Information Sharing
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        We do not sell your personal information. We may share your information with:
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • <Text className="font-semibold">Other Users:</Text> Your public profile information, posts, and 
                        recipes are visible to other Sippin users based on your privacy settings
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • <Text className="font-semibold">Service Providers:</Text> Third-party services that help us operate 
                        the App (e.g., hosting, analytics, authentication)
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-4 ml-4">
                        • <Text className="font-semibold">Legal Requirements:</Text> When required by law or to protect our 
                        rights and users' safety
                    </Text>

                    <Heading level="h3" className="mb-3">
                        4. Third-Party Services
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        We use the following third-party services:
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • <Text className="font-semibold">Supabase:</Text> Database and authentication services
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • <Text className="font-semibold">PostHog:</Text> Analytics to understand user behavior
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • <Text className="font-semibold">Google Analytics:</Text> Website traffic and acquisition tracking
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-4 ml-4">
                        • <Text className="font-semibold">Google Sign-In:</Text> Optional authentication method
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-4">
                        These services have their own privacy policies, and we recommend reviewing them.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        5. Data Security
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        We implement industry-standard security measures to protect your information, including encryption 
                        for sensitive data and secure authentication protocols. However, no method of transmission over the 
                        internet is 100% secure, and we cannot guarantee absolute security.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        6. Your Rights and Choices
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-2">
                        You have the right to:
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Access and download your personal data
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Update or correct your information through your profile settings
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Delete your account and associated data
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Control notification preferences in settings
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-4 ml-4">
                        • Opt out of analytics tracking
                    </Text>

                    <Heading level="h3" className="mb-3">
                        7. Data Retention
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        We retain your information for as long as your account is active or as needed to provide services. 
                        When you delete your account, we will delete or anonymize your personal data within 30 days, except 
                        where we are required to retain it for legal purposes.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        8. Children's Privacy
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        Sippin is not intended for individuals under the legal drinking age in their jurisdiction. We do not 
                        knowingly collect personal information from underage users. If we learn that we have collected such 
                        information, we will take steps to delete it.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        9. International Data Transfers
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        Your information may be transferred to and processed in countries other than your own. We ensure that 
                        appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        10. Changes to This Policy
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        We may update this Privacy Policy from time to time. We will notify you of significant changes through 
                        the App or via email. Your continued use of the App after changes constitutes acceptance of the updated 
                        policy.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        11. Contact Us
                    </Heading>
                    <Text className="text-sm text-neutral-700">
                        If you have questions or concerns about this Privacy Policy or your data, please contact us at 
                        privacy@sippin.app or through the App's support feature.
                    </Text>
                </Box>
            </ScrollView>
        </Box>
    );
};
