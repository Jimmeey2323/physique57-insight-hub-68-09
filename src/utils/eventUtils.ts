// Utility functions for safe event handling

export const safeGetTargetValue = (event: any): string => {
  try {
    return event?.target?.value || '';
  } catch (error) {
    console.warn('Error accessing event target value:', error);
    return '';
  }
};

export const safeGetTargetNumberValue = (event: any): number | undefined => {
  try {
    const value = event?.target?.value;
    return value ? Number(value) : undefined;
  } catch (error) {
    console.warn('Error accessing event target number value:', error);
    return undefined;
  }
};

export const safeGetTargetFloatValue = (event: any): number | undefined => {
  try {
    const value = event?.target?.value;
    return value ? parseFloat(value) : undefined;
  } catch (error) {
    console.warn('Error accessing event target float value:', error);
    return undefined;
  }
};

export const safeGetTargetIntValue = (event: any): number | undefined => {
  try {
    const value = event?.target?.value;
    return value ? parseInt(value) : undefined;
  } catch (error) {
    console.warn('Error accessing event target int value:', error);
    return undefined;
  }
};