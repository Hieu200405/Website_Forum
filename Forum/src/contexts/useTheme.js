import { useContext } from 'react';
import { ThemeContext } from './themeContextObj';

export const useTheme = () => useContext(ThemeContext);
