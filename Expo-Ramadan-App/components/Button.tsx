import { Pressable, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'md' | 'lg';
  accessibilityHint?: string;
  disabled?: boolean;
  className?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  accessibilityHint,
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseClasses = 'items-center justify-center rounded-card shadow-sm';

  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-surface',
    outline: 'bg-transparent border-2 border-primary',
  };

  const sizeClasses = {
    md: 'min-h-touch-min px-6',
    lg: 'min-h-touch-comfortable px-8',
  };

  const textVariantClasses = {
    primary: 'text-text-on-primary',
    secondary: 'text-primary',
    outline: 'text-primary',
  };

  const textSizeClasses = {
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-60 bg-divider' : ''
      } active:opacity-80 ${className}`}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <Text
        className={`font-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]} ${
          disabled ? 'text-text-secondary' : ''
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
