import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

const sampleCocktails = [
  {
    id: '1',
    name: 'Negroni',
    description: 'Classic bitter-sweet cocktail with gin, Campari and vermouth.',
    image: '',
    rating: 4.7,
  },
  {
    id: '2',
    name: 'Margarita',
    description: 'Tequila, triple sec and lime - bright and refreshing.',
    image: '',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Old Fashioned',
    description: 'Whiskey-forward, sugar and bitters, stirred with ice.',
    image: '',
    rating: 4.8,
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoEmoji}>🍸</Text>
              </View>
              <Text style={styles.logoText}>Cocktail Companion</Text>
            </View>
            <TouchableOpacity style={styles.profileBtn}>
              <Text style={styles.profileText}>👤</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Discover Your{'\n'}Perfect Cocktail
            </Text>
            <Text style={styles.heroSubtitle}>
              Log favorites, find recipes, and plan amazing parties
            </Text>
          </View>
        </LinearGradient>

        {/* Search Bar - Overlapping */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search cocktails or ingredients..."
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>➕</Text>
                </View>
                <Text style={styles.actionTitle}>Log a Cocktail</Text>
                <Text style={styles.actionDesc}>Save & rate what you tried</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#ec4899', '#f97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>📖</Text>
                </View>
                <Text style={styles.actionTitle}>Find by Ingredients</Text>
                <Text style={styles.actionDesc}>Use what you have</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#14b8a6', '#06b6d4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>🎉</Text>
                </View>
                <Text style={styles.actionTitle}>Plan a Party</Text>
                <Text style={styles.actionDesc}>Perfect quantities</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Cocktails</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllBtn}>View All →</Text>
            </TouchableOpacity>
          </View>

          {/* Cocktail Cards */}
          {sampleCocktails.map((cocktail, index) => (
            <TouchableOpacity 
              key={cocktail.id} 
              style={styles.cocktailCard}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: cocktail.image }}
                style={styles.cocktailImage}
                resizeMode="cover"
              />
              
              {/* Gradient Overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageGradient}
              >
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {cocktail.rating}</Text>
                </View>
              </LinearGradient>

              <View style={styles.cocktailInfo}>
                <Text style={styles.cocktailName}>{cocktail.name}</Text>
                <Text style={styles.cocktailDesc} numberOfLines={2}>
                  {cocktail.description}
                </Text>
                
                <View style={styles.cocktailFooter}>
                  <TouchableOpacity style={styles.viewRecipeBtn}>
                    <Text style={styles.viewRecipeText}>View Recipe</Text>
                    <Text style={styles.arrowIcon}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* CTA Card */}
          <LinearGradient
            colors={['#6366f1', '#8b5cf6', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <Text style={styles.ctaEmoji}>✨</Text>
            <Text style={styles.ctaTitle}>Create Your Own</Text>
            <Text style={styles.ctaDesc}>
              Share signature recipes with the community
            </Text>
            <TouchableOpacity style={styles.ctaBtn}>
              <Text style={styles.ctaBtnText}>Create Recipe</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpace} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 20,
  },
  heroContent: {
    marginTop: 8,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  searchWrapper: {
    paddingHorizontal: 24,
    marginTop: -40,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  content: {
    paddingHorizontal: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  viewAllBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  cocktailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cocktailImage: {
    width: '100%',
    height: 200,
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'space-between',
    padding: 16,
  },
  ratingBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cocktailInfo: {
    padding: 20,
  },
  cocktailName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  cocktailDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  cocktailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  viewRecipeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginRight: 6,
  },
  arrowIcon: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  ctaCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  ctaEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDesc: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  bottomSpace: {
    height: 40,
  },
});