import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenContainer } from '../components/ScreenContainer';
import { StudyAppBar } from '../components/StudyAppBar';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useSampleContext } from '../context/SampleContext';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const RATING_ROW_A = [0, 1, 2, 3, 4, 5] as const;
const RATING_ROW_B = [6, 7, 8, 9, 10] as const;

type RatingChipProps = {
  value: number;
  selected: boolean;
  onPress: () => void;
};

function RatingChip({
  value,
  selected,
  onPress,
}: RatingChipProps): React.JSX.Element {
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
        style={[
          styles.ratingChipText,
          selected && styles.ratingChipTextSelected,
        ]}
      >
        {value}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }: Props): React.JSX.Element {
  const [selectedRating, setSelectedRating] = useState<number>(8);

  // real data
  const {
    currentSample,
    isLoading,
    error,
    retryLoadSession,
    setPendingAppearanceRating,
  } = useSampleContext();

  // loading state
  if (isLoading) {
    return (
      <ScreenContainer testID="screen-home">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.infoText}>Ladataan istuntoa...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // error state
  if (error) {
    return (
      <ScreenContainer testID="screen-home">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>{error}</Text>
          <Pressable
            onPress={async () => {
              await retryLoadSession();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Yritä uudelleen"
          >
            <Text style={styles.retryButtonLabel}>Yritä uudelleen</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // empty state
  if (!currentSample) {
    return (
      <ScreenContainer testID="screen-home">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>
            Ei arvioitavia näytteitä juuri nyt.
          </Text>
          <Pressable
            onPress={async () => {
              await retryLoadSession();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Päivitä näkymä"
          >
            <Text style={styles.retryButtonLabel}>Päivitä</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer testID="screen-home">
      <View style={styles.root}>
        <StudyAppBar />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Aistinvarainen arviointi</Text>

          <View style={styles.sampleCard}>
            <Text style={styles.sampleLabel}>Nykyinen näytekoodi:</Text>
            <Text style={styles.sampleCode}>{currentSample}</Text>
          </View>

          <Text style={styles.instruction}>
            Arvioi näytteen miellyttävyyttä.
          </Text>

          <View style={styles.ratingCard}>
            <Text style={styles.ratingCardTitle}>Ulkonäkö</Text>
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
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() => {
              setPendingAppearanceRating(selectedRating);
              navigation.navigate('Sample');
            }}
            accessibilityRole="button"
            accessibilityLabel="Seuraava näkymä"
          >
            <Text style={styles.ctaLabel}>Seuraava</Text>
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

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  infoText: {
    marginTop: spacing.md,
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
  },
  retryButtonPressed: {
    opacity: 0.9,
  },
  retryButtonLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.onPrimary,
  },
});
