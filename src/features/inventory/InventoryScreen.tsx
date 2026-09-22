import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useInventorySearch } from './useInventorySearch';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ConnectionBadge } from '@/ui/ConnectionBadge';
import { EmptyState } from '@/ui/EmptyState';
import { Field } from '@/ui/Field';
import { Screen } from '@/ui/Screen';
import { colors, spacing } from '@/ui/theme';

export function InventoryScreen() {
  const { items, searched, loading, error, search } = useInventorySearch();
  const [query, setQuery] = useState('');

  return (
    <Screen>
      <ConnectionBadge />

      <View>
        <Text style={styles.title}>Inventory</Text>
        <Text style={styles.subtitle}>
          Search SKU, barcode, bin, lot, serial, or product name.
        </Text>
      </View>

      <Field
        label="Inventory search"
        placeholder="SKU or barcode"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        returnKeyType="search"
        onSubmitEditing={() => void search(query)}
      />

      <Button
        title="Search inventory"
        onPress={() => void search(query)}
        loading={loading}
        disabled={!query.trim()}
      />

      {error ? <Card title="Search failed" subtitle={error} /> : null}

      {searched && !loading && !error && items.length === 0 ? (
        <EmptyState
          title="No inventory found"
          message="The active connector returned no matching inventory."
        />
      ) : null}

      {items.map((item) => (
        <Card
          key={item.id}
          title={item.name ? `${item.sku} · ${item.name}` : item.sku}
          subtitle={[item.warehouse, item.location].filter(Boolean).join(' · ') || 'Location unavailable'}
        >
          <View style={styles.stockRow}>
            <View>
              <Text style={styles.stockLabel}>On hand</Text>
              <Text style={styles.stockValue}>
                {item.quantity ?? '—'} {item.uom ?? ''}
              </Text>
            </View>
            <View>
              <Text style={styles.stockLabel}>Available</Text>
              <Text style={styles.stockValue}>
                {item.available ?? '—'} {item.uom ?? ''}
              </Text>
            </View>
          </View>

          {item.barcode ? <Text style={styles.barcode}>Barcode: {item.barcode}</Text> : null}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  subtitle: { color: colors.textMuted, marginTop: 4, lineHeight: 21 },
  stockRow: { flexDirection: 'row', gap: 34 },
  stockLabel: { color: colors.textMuted, fontSize: 12 },
  stockValue: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 3 },
  barcode: { color: colors.textMuted, fontSize: 12 },
});
