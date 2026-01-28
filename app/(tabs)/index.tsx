import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 1. 타입 정의 (TypeScript의 핵심)
interface TrendingItem {
  id: number;
  title: string;
  desc: string;
  image: string;
  tag: string;
}

interface LookItem {
  id: number;
  title: string;
  desc: string;
  price: number;
  image: string;
  color: 'warm' | 'cool' | 'neutral'; // 구체적인 타입 지정 가능
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// 테마 컬러
const COLORS = {
  primary: '#FF2D78',
  background: '#FFFFFF',
  text: '#111111',
  gray: '#888888',
  lightGray: '#F4F4F4',
};

// 더미 데이터 (타입 적용)
const TRENDING_DATA: TrendingItem[] = [
  {
    id: 1,
    title: 'Glass Skin Edit',
    desc: 'Achieve the ultimate dewy glow.',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop',
    tag: 'WEEKLY TOP'
  },
  {
    id: 2,
    title: 'Milky Peach',
    desc: 'Soft & Warm daily look.',
    image: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?q=80&w=600&auto=format&fit=crop',
    tag: 'NEW ARRIVAL'
  }
];

const CURATED_LOOKS: LookItem[] = [
  {
    id: 1,
    title: 'Interview Ready',
    desc: 'Natural matte finish',
    price: 45,
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=600&auto=format&fit=crop',
    color: 'warm'
  },
  {
    id: 2,
    title: 'Date Night Pink',
    desc: 'Romantic & bold',
    price: 62,
    image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=600&auto=format&fit=crop',
    color: 'cool'
  },
  {
    id: 3,
    title: 'Daily Glow',
    desc: 'Effortless radiance',
    price: 30,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop',
    color: 'neutral'
  },
  {
    id: 4,
    title: 'Party Glam',
    desc: 'Vibrant & fun',
    price: 55,
    image: 'https://images.unsplash.com/photo-1506956191951-7a88da4435e5?q=80&w=600&auto=format&fit=crop',
    color: 'cool'
  },
];

export default function HomeScreen() {
  const router = useRouter();
  // State에 제네릭 타입 지정 (필수는 아니지만 명시적인 것이 좋음)
  const [activeTab, setActiveTab] = useState<string>('Discover');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LOOKBOOK</Text>
        <TouchableOpacity>
          <Ionicons name="bag-handle-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* 2. Top Tabs */}
      <View style={styles.tabContainer}>
        {['Discover', 'My Looks', 'AI Studio'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* 3. Trending Now */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {TRENDING_DATA.map((item) => (
            <TouchableOpacity key={item.id} style={styles.trendCard} activeOpacity={0.9}>
              <Image source={{ uri: item.image }} style={styles.trendImage} />
              <View style={styles.trendOverlay}>
                <View style={styles.badge}><Text style={styles.badgeText}>{item.tag}</Text></View>
                <Text style={styles.trendTitle}>{item.title}</Text>
                <Text style={styles.trendDesc}>{item.desc}</Text>
                <View style={styles.arrowBtn}>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 4. Curated Looks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Curated Looks</Text>
        </View>

        <View style={styles.gridContainer}>
          {CURATED_LOOKS.map((item) => (
            <View key={item.id} style={styles.lookCard}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image }} style={styles.lookImage} />
                <TouchableOpacity style={styles.heartIcon}>
                  <Ionicons name="heart-outline" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tryOnBadge}>
                  <MaterialCommunityIcons name="face-recognition" size={16} color={COLORS.primary} />
                  <Text style={styles.tryOnText}>Try On</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.lookTitle}>{item.title}</Text>
              <Text style={styles.lookDesc}>{item.desc}</Text>
              
              <View style={styles.priceRow}>
                <Text style={styles.price}>${item.price}</Text>
                <TouchableOpacity style={styles.addBtn}>
                  <Ionicons name="add" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* 5. Bundle Banner */}
        <TouchableOpacity style={styles.bundleBanner}>
          <View>
            <Text style={styles.bundleSub}>BUNDLE & SAVE</Text>
            <Text style={styles.bundleTitle}>Buy any 3 looks, get <Text style={{color: COLORS.primary}}>20% OFF</Text>{'\n'}your total kit.</Text>
          </View>
          <View style={styles.percentCircle}>
            <Text style={styles.percentText}>%</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* 6. Checkout Button */}
      <View style={styles.floatingContainer}>
        <TouchableOpacity style={styles.checkoutBtn}>
          <Ionicons name="cart-outline" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.checkoutText}>Checkout (3)</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-around'
  },
  tabItem: {
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  horizontalScroll: {
    paddingLeft: 20,
    marginBottom: 30,
  },
  trendCard: {
    width: 280,
    height: 180,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trendImage: {
    width: '100%',
    height: '100%',
  },
  trendOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    justifyContent: 'flex-end',
  },
  badge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  trendTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  trendDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  arrowBtn: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  lookCard: {
    width: CARD_WIDTH,
    marginBottom: 24,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  lookImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 6,
  },
  tryOnBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tryOnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  lookTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  lookDesc: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bundleBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#FFF0F5', 
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  bundleSub: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bundleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  percentCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD6E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  }
});