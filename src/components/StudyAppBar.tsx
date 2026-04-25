import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/**
 * Tummansininen yläpalkki — sama ulkoasu kaikilla tutkimus-/arviointinäkymillä.
 */
export function StudyAppBar(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'fi';

  const changeLanguage = (nextLanguage: 'fi' | 'en') => {
    if (activeLanguage === nextLanguage) {
      return;
    }
    i18n.changeLanguage(nextLanguage).catch(() => undefined);
  };

  return (
    <View style={styles.appBar}>
      <View style={styles.appBarLeftSpacer} accessibilityElementsHidden />
      <Text style={styles.appBarTitle} numberOfLines={1}>
        {t('appBar.title')}
      </Text>
      <View style={styles.languageToggle}>
        <Pressable
          style={({ pressed }) => [
            styles.languageButton,
            activeLanguage === 'fi' && styles.languageButtonActive,
            pressed && styles.languageButtonPressed,
          ]}
          onPress={() => {
            changeLanguage('fi');
          }}
          accessibilityRole="button"
          accessibilityLabel={t('appBar.switch_to_finnish')}
          accessibilityState={{ selected: activeLanguage === 'fi' }}
        >
          <Text
            style={[
              styles.languageButtonLabel,
              activeLanguage === 'fi' && styles.languageButtonLabelActive,
            ]}
          >
            FI
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.languageButton,
            activeLanguage === 'en' && styles.languageButtonActive,
            pressed && styles.languageButtonPressed,
          ]}
          onPress={() => {
            changeLanguage('en');
          }}
          accessibilityRole="button"
          accessibilityLabel={t('appBar.switch_to_english')}
          accessibilityState={{ selected: activeLanguage === 'en' }}
        >
          <Text
            style={[
              styles.languageButtonLabel,
              activeLanguage === 'en' && styles.languageButtonLabelActive,
            ]}
          >
            EN
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.appBar,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appBarLeftSpacer: {
    width: 44,
    height: 44,
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.h2,
    fontWeight: '700',
    color: colors.onAppBar,
    letterSpacing: 0.5,
  },
  languageToggle: {
    width: 78,
    flexDirection: 'row',
    gap: 4,
  },
  languageButton: {
    flex: 1,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.onAppBar,
    backgroundColor: 'transparent',
  },
  languageButtonActive: {
    backgroundColor: colors.onAppBar,
  },
  languageButtonPressed: {
    opacity: 0.8,
  },
  languageButtonLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.onAppBar,
  },
  languageButtonLabelActive: {
    color: colors.appBar,
  },
});
