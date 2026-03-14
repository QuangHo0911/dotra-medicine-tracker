import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
  initialTime?: string; // Format: "HH:MM"
}

const { width } = Dimensions.get('window');

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialTime = '09:00',
}) => {
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);

  // Parse initial time when modal opens
  useEffect(() => {
    if (visible && initialTime) {
      const [h, m] = initialTime.split(':').map(Number);
      setHours(isNaN(h) ? 9 : h);
      setMinutes(isNaN(m) ? 0 : m);
    }
  }, [visible, initialTime]);

  const handleConfirm = () => {
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onConfirm(formattedTime);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Generate hour options (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  // Generate minute options (00-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select Time</Text>

          <View style={styles.pickersContainer}>
            {/* Hours Picker */}
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={hours}
                onValueChange={(value) => setHours(value as number)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {hourOptions.map((hour) => (
                  <Picker.Item
                    key={hour}
                    label={hour.toString().padStart(2, '0')}
                    value={hour}
                  />
                ))}
              </Picker>
            </View>

            {/* Separator */}
            <Text style={styles.separator}>:</Text>

            {/* Minutes Picker */}
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={minutes}
                onValueChange={(value) => setMinutes(value as number)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {minuteOptions.map((minute) => (
                  <Picker.Item
                    key={minute}
                    label={minute.toString().padStart(2, '0')}
                    value={minute}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.button, styles.confirmButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: Math.min(width - 40, 320),
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  pickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 20,
  },
  pickerWrapper: {
    alignItems: 'center',
    width: 100,
  },
  picker: {
    width: 100,
    height: 180,
  },
  pickerItem: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  separator: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
