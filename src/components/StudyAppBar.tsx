import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type StudyAppBarProps = {
  showBackButton?: boolean;
  onBackPress?: () => void;
};

/**
 * Tummansininen yläpalkki — sama ulkoasu kaikilla tutkimus-/arviointinäkymillä.
 */
export function StudyAppBar({
  showBackButton = false,
  onBackPress,
}: StudyAppBarProps): React.JSX.Element {
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
      {showBackButton ? (
        <Pressable
          style={styles.appBarLeftSlot}
          onPress={() => onBackPress?.()}
          disabled={!onBackPress}
          accessibilityRole="button"
          accessibilityLabel={t('appBar.back_accessibility')}
        >
          <View style={styles.backIcon} />
        </Pressable>
      ) : (
        <View style={styles.appBarLeftSlot} accessibilityElementsHidden>
          <View style={styles.homeIcon}>
            <View style={styles.homeRoofLeft} />
            <View style={styles.homeRoofRight} />
            <View style={styles.homeBody} />
            <View style={styles.homeDoor} />
          </View>
        </View>
      )}
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
  appBarLeftSlot: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 12,
    height: 12,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.onAppBar,
    transform: [{ rotate: '45deg' }],
    marginLeft: 6,
  },
  homeIcon: {
    width: 18,
    height: 16,
    position: 'relative',
  },
  homeRoofLeft: {
    position: 'absolute',
    top: 1,
    left: 2,
    width: 9,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.onAppBar,
    transform: [{ rotate: '-35deg' }],
  },
  homeRoofRight: {
    position: 'absolute',
    top: 1,
    right: 2,
    width: 9,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.onAppBar,
    transform: [{ rotate: '35deg' }],
  },
  homeBody: {
    position: 'absolute',
    left: 3,
    right: 3,
    bottom: 0,
    top: 6,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: colors.onAppBar,
  },
  homeDoor: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: 4,
    height: 6,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    backgroundColor: colors.onAppBar,
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
