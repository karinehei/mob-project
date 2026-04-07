import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';

import { ScreenContainer } from '../components/ScreenContainer';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const RATING_ROW_A = [0, 1, 2, 3, 4, 5] as const;
const RATING_ROW_B = [6, 7, 8, 9, 10] as const;

function AppBarMenuIcon(): React.JSX.Element {
  return (
    <View style={styles.menuIcon} accessibilityElementsHidden>
      <View style={styles.menuBar} />
      <View style={styles.menuBar} />
      <View style={styles.menuBar} />
    </View>
  );
}

type RatingChipProps = {
  value: number;
  selected: boolean;
  onPress: () => void;
};

function RatingChip({ value, selected, onPress }: RatingChipProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ratingChip,
        selected && styles.ratingChipSelected,
        pressed && !selected && styles.ratingChipPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Arvo ${value}`}
    >
      <Text
        style={[styles.ratingChipText, selected && styles.ratingChipTextSelected]}
      >
        {value}
      </Text>
    </Pressable>
  );
}

/**
 * Entry screen shell. Layout aligned with sensory evaluation wireframe; no study flow yet.
 */
export default function HomeScreen({ navigation }: Props)  {
  // Local UI state only — replace with study flow / persistence later.
  const [selectedRating, setSelectedRating] = useState<number>(8);

  return (
    <ScreenContainer testID="screen-home">
      <View style={styles.root}>
        <View style={styles.appBar}>
          <Pressable
            style={styles.appBarIconHit}
            onPress={() => {
              /* TODO: drawer / nav when defined */
            }}
            accessibilityRole="button"
            accessibilityLabel="Valikko"
          >
            <AppBarMenuIcon />
          </Pressable>
          <Text style={styles.appBarTitle} numberOfLines={1}>
            Food_Study
          </Text>
          <View style={styles.appBarSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Sensory Evaluation</Text>

          <View style={styles.sampleCard}>
            <Text style={styles.sampleLabel}>Current Sample Code:</Text>
            <Text style={styles.sampleCode}>451</Text>
            {/* TODO: replace with session sample id */}
          </View>

          <Text style={styles.instruction}>
            Evaluate the pleasantness of the sample.
          </Text>

          <View style={styles.ratingCard}>
            <Text style={styles.ratingCardTitle}>Ulkonäkö / Appearance</Text>
            <Text style={styles.scaleLegend}>
              0 = Erittäin epämiellyttävä{'\n'}
              10 = Erittäin miellyttävä
            </Text>

            <View style={styles.chipBlock}>
              <View style={styles.chipRow}>
                {RATING_ROW_A.map((n) => (
                  <RatingChip
                    key={n}
                    value={n}
                    selected={selectedRating === n}
                    onPress={() => setSelectedRating(n)}
                  />
                ))}
              </View>
              <View style={[styles.chipRow, styles.chipRowSecond]}>
                {RATING_ROW_B.map((n) => (
                  <RatingChip
                    key={n}
                    value={n}
                    selected={selectedRating === n}
                    onPress={() => setSelectedRating(n)}
                  />
                ))}
              </View>
            </View>
            {/* TODO: scoring model, validation, Firestore / API */}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() => navigation.navigate('Sample')}
            accessibilityRole="button"
            accessibilityLabel="Seuraava näkymä"
            >
            <Text style={styles.ctaLabel}>Next screen</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const CHIP_SIZE = 44;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.appBar,
  },
  appBarIconHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    justifyContent: 'space-between',
    height: 14,
    width: 20,
  },
  menuBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.onAppBar,
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.body,
    fontWeight: '700',
    color: colors.onAppBar,
  },
  appBarSpacer: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  pageTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sampleCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.sampleCardBg,
  },
  sampleLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.sampleAccent,
  },
  sampleCode: {
    marginTop: spacing.sm,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
    color: colors.sampleAccent,
  },
  instruction: {
    marginTop: spacing.lg,
    ...typography.body,
    color: colors.textSecondary,
  },
  ratingCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  ratingCardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scaleLegend: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  chipBlock: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  chipRowSecond: {
    paddingHorizontal: CHIP_SIZE / 2 + spacing.xs / 2,
  },
  ratingChip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  ratingChipSelected: {
    backgroundColor: colors.ratingSelectedBg,
    borderWidth: 2,
    borderColor: colors.ratingSelectedBorder,
  },
  ratingChipPressed: {
    opacity: 0.92,
  },
  ratingChipText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ratingChipTextSelected: {
    color: colors.sampleAccent,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cta: {
    borderRadius: 999,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.onPrimary,
  },
});
