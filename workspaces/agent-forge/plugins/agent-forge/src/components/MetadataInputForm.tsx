/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  makeStyles,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import InfoIcon from '@material-ui/icons/Info';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const useStyles = makeStyles(theme => ({
  formContainer: {
    padding: theme.spacing(1.5),
    margin: theme.spacing(1, 0),
    backgroundColor: theme.palette.type === 'dark' ? '#1e1e1e' : '#f5f5f5',
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(0.5),
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    gap: theme.spacing(0.5),
  },
  formTitle: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: theme.palette.primary.main,
  },
  fieldContainer: {
    marginBottom: theme.spacing(1.5),
  },
  submitButton: {
    marginTop: theme.spacing(1.5),
  },
  requiredChip: {
    marginLeft: theme.spacing(0.5),
    height: 18,
    fontSize: '0.65rem',
  },
  helperText: {
    fontSize: '0.7rem',
    marginTop: theme.spacing(0.25),
    color: theme.palette.text.secondary,
  },
  infoBox: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.type === 'dark' ? '#2a2a2a' : '#e3f2fd',
    borderRadius: theme.spacing(0.5),
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  markdownContent: {
    fontSize: '0.85rem',
    '& p': {
      margin: 0,
      marginBottom: theme.spacing(0.5),
    },
    '& strong': {
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
    '& ul, & ol': {
      margin: 0,
      paddingLeft: theme.spacing(2.5),
    },
    '& li': {
      marginBottom: theme.spacing(0.25),
    },
  },
}));

export interface MetadataField {
  name: string;
  label?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'boolean';
  required?: boolean;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface MetadataInputFormProps {
  title?: string;
  description?: string;
  fields: MetadataField[];
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

/**
 * CopilotKit-style metadata input form component
 * Displays dynamic input fields based on metadata schema
 * @public
 */
export const MetadataInputForm: React.FC<MetadataInputFormProps> = ({
  title = 'Input Required',
  description,
  fields,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Submit',
}) => {
  const classes = useStyles();
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.name] = field.defaultValue ?? (field.type === 'boolean' ? false : '');
    });
    return initialData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateField = (field: MetadataField, value: any): string | null => {
    if (field.required && !value && value !== 0 && value !== false) {
      return `${field.label || field.name} is required`;
    }

    if (field.validation) {
      const { min, max, pattern, minLength, maxLength } = field.validation;

      if (field.type === 'number') {
        const numValue = Number(value);
        if (min !== undefined && numValue < min) {
          return `Must be at least ${min}`;
        }
        if (max !== undefined && numValue > max) {
          return `Must be at most ${max}`;
        }
      }

      if (typeof value === 'string') {
        if (minLength !== undefined && value.length < minLength) {
          return `Must be at least ${minLength} characters`;
        }
        if (maxLength !== undefined && value.length > maxLength) {
          return `Must be at most ${maxLength} characters`;
        }
        if (pattern && !new RegExp(pattern).test(value)) {
          return `Invalid format`;
        }
      }
    }

    return null;
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const renderField = (field: MetadataField) => {
    const fieldValue = formData[field.name];
    const error = errors[field.name];

    switch (field.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={fieldValue || false}
                onChange={e => handleChange(field.name, e.target.checked)}
                color="primary"
              />
            }
            label={field.label || field.name}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth variant="outlined" error={!!error}>
            <InputLabel>{field.label || field.name}</InputLabel>
            <Select
              value={fieldValue || ''}
              onChange={e => handleChange(field.name, e.target.value)}
              label={field.label || field.name}
            >
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
            {!error && field.description && (
              <FormHelperText>{field.description}</FormHelperText>
            )}
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label={field.label || field.name}
            value={fieldValue || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            error={!!error}
            helperText={error || field.description}
            required={field.required}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            variant="outlined"
            label={field.label || field.name}
            value={fieldValue || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            error={!!error}
            helperText={error || field.description}
            required={field.required}
            inputProps={{
              min: field.validation?.min,
              max: field.validation?.max,
            }}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            type={field.type || 'text'}
            variant="outlined"
            label={field.label || field.name}
            value={fieldValue || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            error={!!error}
            helperText={error || field.description}
            required={field.required}
          />
        );
    }
  };

  return (
    <Paper className={classes.formContainer} elevation={2}>
      <Box className={classes.formHeader}>
        <InfoIcon color="primary" fontSize="small" />
        <Typography variant="h6" className={classes.formTitle}>
          {title}
        </Typography>
      </Box>

      {description && (
        <Box className={classes.infoBox}>
          <Box className={classes.markdownContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </Box>
        </Box>
      )}

      <Divider style={{ marginBottom: 12 }} />

      <Grid container spacing={1}>
        {fields.map(field => (
          <Grid item xs={12} key={field.name}>
            <Box className={classes.fieldContainer}>
              <Box display="flex" alignItems="center">
                {renderField(field)}
                {field.required && field.type !== 'boolean' && (
                  <Chip
                    label="Required"
                    size="small"
                    color="secondary"
                    className={classes.requiredChip}
                  />
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={classes.submitButton}
        startIcon={<SendIcon />}
      >
        {isSubmitting ? 'Submitting...' : submitButtonText}
      </Button>
    </Paper>
  );
};

