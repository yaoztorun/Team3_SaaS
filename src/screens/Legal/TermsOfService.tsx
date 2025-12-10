import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Heading } from '@/src/components/global';
import { useNavigation } from '@react-navigation/native';

export const TermsOfService: React.FC = () => {
    const navigation = useNavigation();

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar 
                title="Terms of Service" 
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

                    <Heading level="h3" className="mb-3">
                        1. Acceptance of Terms
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        By accessing and using Sippin ("the App"), you accept and agree to be bound by these Terms of Service. 
                        If you do not agree to these terms, please do not use the App.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        2. User Accounts
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                        that occur under your account. You must immediately notify us of any unauthorized use of your account.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        3. User Content
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        You retain ownership of the content you post on Sippin, including cocktail recipes, photos, and reviews. 
                        By posting content, you grant Sippin a non-exclusive, worldwide license to use, display, and distribute 
                        your content within the App. You are responsible for ensuring that your content does not violate any 
                        third-party rights or applicable laws.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        4. Prohibited Activities
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-2">
                        You agree not to:
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Post offensive, harmful, or inappropriate content
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Impersonate others or create fake accounts
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-1 ml-4">
                        • Attempt to gain unauthorized access to the App or its systems
                    </Text>
                    <Text className="text-sm text-neutral-700 mb-4 ml-4">
                        • Use the App for any illegal or unauthorized purpose
                    </Text>

                    <Heading level="h3" className="mb-3">
                        5. Age Restriction
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        Sippin is intended for users who are of legal drinking age in their jurisdiction. By using the App, 
                        you confirm that you meet this requirement. We do not knowingly collect data from users under the 
                        legal drinking age.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        6. Disclaimer
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        The App is provided "as is" without warranties of any kind. We do not guarantee the accuracy or 
                        completeness of cocktail recipes or information provided by users. Always consume alcohol responsibly 
                        and be aware of your local laws regarding alcohol consumption.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        7. Limitation of Liability
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        Sippin shall not be liable for any indirect, incidental, special, or consequential damages arising 
                        from your use of the App. Our total liability shall not exceed the amount you have paid to use the App.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        8. Modifications to Terms
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        We reserve the right to modify these Terms of Service at any time. We will notify users of significant 
                        changes through the App or via email. Continued use of the App after changes constitutes acceptance of 
                        the modified terms.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        9. Termination
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        We reserve the right to suspend or terminate your account if you violate these Terms of Service or 
                        engage in harmful behavior. You may also delete your account at any time through the App settings.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        10. Governing Law
                    </Heading>
                    <Text className="text-sm text-neutral-700 mb-4">
                        These Terms of Service are governed by the laws of Belgium. Any disputes shall be resolved in the 
                        courts of Belgium.
                    </Text>

                    <Heading level="h3" className="mb-3">
                        11. Contact Us
                    </Heading>
                    <Text className="text-sm text-neutral-700">
                        If you have any questions about these Terms of Service, please contact us through the App or at 
                        support@sippin.app.
                    </Text>
                </Box>
            </ScrollView>
        </Box>
    );
};
