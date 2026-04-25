import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../components/ScreenContainer';
import { StudyAppBar } from '../components/StudyAppBar';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, shadows } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useSampleContext } from '../context/SampleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { nextSample, resetSession } = useSampleContext();

  const saveSucceeded = route.params?.saveSucceeded === true;
  const flowCompleted = route.params?.flowCompleted === true;

  const primaryCtaLabel = flowCompleted
    ? t('result_screen.new_round')
    : t('result_screen.next_sample');
  const onBackPress = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  const handleNextStep = () => {
    if (flowCompleted) {
      resetSession();
    } else {
      nextSample();
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <ScreenContainer testID="screen-result">
      <View style={styles.root}>
        <StudyAppBar showBackButton onBackPress={onBackPress} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>{t('result_screen.title')}</Text>

          <Text style={styles.lead}>{t('result_screen.lead')}</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              {flowCompleted
                ? t('result_screen.all_done_title')
                : saveSucceeded
                  ? t('result_screen.saved_title')
                  : t('result_screen.title')}
            </Text>
            <Text style={styles.infoBody}>
              {flowCompleted
                ? t('result_screen.all_done_body')
                : saveSucceeded
                  ? t('result_screen.saved_body')
                  : t('result_screen.default_body')}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={handleNextStep}
            accessibilityRole="button"
            accessibilityLabel={primaryCtaLabel}
          >
            <Text style={styles.ctaLabel}>{primaryCtaLabel}</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

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
    ...typography.title,
    color: colors.textPrimary,
  },
  lead: {
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.textSecondary,
  },
  infoCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  infoTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  infoBody: {
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cta: {
    borderRadius: 999,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaLabel: {
    ...typography.button,
    color: colors.onPrimary,
  },
});
