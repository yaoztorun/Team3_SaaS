import React from 'react';
import { Text } from '@/src/components/ui/text';
import type { TextProps } from 'react-native';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps extends Omit<TextProps, 'className'> {
  level?: HeadingLevel;
  className?: string;
  children: React.ReactNode;
}

const headingStyles: Record<HeadingLevel, string> = {
  h1: 'text-4xl font-bold',
  h2: 'text-3xl font-bold',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',
};

export const Heading: React.FC<HeadingProps> = ({ 
  level = 'h3', 
  className = '', 
  children,
  ...props 
}) => {
  const baseStyles = headingStyles[level];
  
  return (
    <Text 
      className={`font-heading ${baseStyles} ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
};
