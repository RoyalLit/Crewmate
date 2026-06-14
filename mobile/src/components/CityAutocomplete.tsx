import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { spacing } from '../design/tokens';

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  placeholder: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export function CityAutocomplete({ value, onChange, placeholder, iconName }: CityAutocompleteProps) {
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const searchCities = async (text: string) => {
    setQuery(text);
    onChange(text); // Let parent know what they typed

    if (text.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Using OpenStreetMap Nominatim API - free and perfect for Indian cities
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=5&countrycodes=IN`,
          {
            headers: {
              'User-Agent': 'CrewmuteApp/1.0',
            },
          }
        );
        const data = await response.json();
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error('City search failed', error);
      } finally {
        setLoading(false);
      }
    }, 600); // Debounce to respect Nominatim limits
  };

  const handleSelect = (cityItem: any) => {
    // Extract the primary city/town name
    const address = cityItem.address;
    const cityName = address.city || address.town || address.village || address.state_district || cityItem.name;
    
    setQuery(cityName);
    onChange(cityName);
    setShowDropdown(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
        <Ionicons name={iconName} size={20} color={colors.text.placeholder} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.placeholder}
          keyboardAppearance={isDark ? 'dark' : 'light'}
          value={query}
          onChangeText={searchCities}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          onBlur={() => {
            // Slight delay so the press event can fire before dropdown disappears
            setTimeout(() => setShowDropdown(false), 200);
          }}
        />
        {loading && <ActivityIndicator size="small" color={colors.interactive.primary} />}
      </View>

      {showDropdown && results.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: colors.background.subtle, borderColor: colors.border.default }]}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.dropdownItem,
                  pressed && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                onPress={() => handleSelect(item)}
              >
                <Ionicons name="location-outline" size={16} color={colors.text.secondary} style={{ marginRight: 8, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, { color: colors.text.primary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemSubtitle, { color: colors.text.secondary }]} numberOfLines={1}>
                    {item.display_name}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
    height: '100%',
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 220,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  itemTitle: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 15,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 12,
  },
});
