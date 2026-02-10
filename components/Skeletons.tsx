import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  ICON_SIZE,
  SPACING,
} from "../constants/theme";

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  style?: any;
}

export const SkeletonBox = ({ width, height, style }: SkeletonBoxProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: COLORS.skeletonBase,
          borderRadius: BORDER_RADIUS.sm,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const TrendingSkeleton = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.horizontalScroll}
    >
      {[1, 2, 3].map((index) => (
        <View key={index} style={styles.trendCard}>
          <SkeletonBox
            width={280}
            height={180}
            style={{ borderRadius: BORDER_RADIUS.lg }}
          />
        </View>
      ))}
    </ScrollView>
  );
};

interface CuratedLogsSkeletonProps {
  cardWidth: number;
}

export const CuratedLooksSkeleton = ({
  cardWidth,
}: CuratedLogsSkeletonProps) => {
  return (
    <View style={styles.gridContainer}>
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <View key={index} style={[styles.lookCard, { width: cardWidth }]}>
          <SkeletonBox
            width={cardWidth}
            height={200}
            style={{ borderRadius: BORDER_RADIUS.lg, marginBottom: 10 }}
          />
          <SkeletonBox
            width={cardWidth * 0.7}
            height={16}
            style={{ marginBottom: 6 }}
          />
          <SkeletonBox
            width={cardWidth * 0.5}
            height={12}
            style={{ marginBottom: 8 }}
          />
          <View style={styles.priceRow}>
            <SkeletonBox width={60} height={20} />
            <SkeletonBox
              width={ICON_SIZE.xl}
              height={ICON_SIZE.xl}
              style={{ borderRadius: BORDER_RADIUS.lg }}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalScroll: {
    paddingLeft: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  trendCard: {
    width: 280,
    height: 180,
    marginRight: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.lg,
    columnGap: SPACING.sm,
    rowGap: SPACING.xl,
  },
  lookCard: {
    marginBottom: SPACING.lg,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
