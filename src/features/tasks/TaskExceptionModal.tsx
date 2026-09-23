import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { TaskItem } from '@/connectors/core/types';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { colors, radius, spacing } from '@/ui/theme';

const severities = ['low', 'medium', 'high', 'critical'] as const;

type Props = {
  task: TaskItem | null;
  submitting: boolean;
  onClose(): void;
  onSubmit(input: {
    taskId: string;
    description: string;
    severity: string;
  }): Promise<void>;
};

export function TaskExceptionModal({
  task,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<(typeof severities)[number]>('medium');

  useEffect(() => {
    if (task) {
      setDescription('');
      setSeverity('medium');
    }
  }, [task]);

  if (!task) return null;

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Report task exception</Text>
            <Text style={styles.subtitle}>{task.title}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onClose} disabled={submitting}>
            <Text style={styles.close}>Cancel</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Severity</Text>
        <View style={styles.severityRow}>
          {severities.map((item) => {
            const active = item === severity;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                onPress={() => setSeverity(item)}
                style={[styles.severity, active && styles.severityActive]}
              >
                <Text style={[styles.severityText, active && styles.severityTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Field
          label="What happened?"
          placeholder="Wrong item, damaged product, short pick, blocked location…"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.description}
        />

        <Button
          title="Report Exception"
          variant="danger"
          loading={submitting}
          disabled={!description.trim()}
          onPress={() =>
            void onSubmit({
              taskId: task.id,
              description: description.trim(),
              severity,
            })
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: colors.textMuted, marginTop: 4 },
  close: { color: colors.primary, fontWeight: '800', paddingVertical: 8 },
  label: { color: colors.text, fontWeight: '800' },
  severityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  severity: {
    minHeight: 42,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  severityActive: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  severityText: { color: colors.text, fontWeight: '800', textTransform: 'capitalize' },
  severityTextActive: { color: colors.danger },
  description: { minHeight: 130, textAlignVertical: 'top', paddingTop: spacing.md },
});
