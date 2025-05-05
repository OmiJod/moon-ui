import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Calendar, Clock, Search, Mail, Lock, User, Phone, MapPin, Globe, Link, Hash, FileText, DollarSign, ChevronLeft, ChevronRight, FormInput } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputField {
  id: string;
  label: string;
  type: string;
  icon?: string;
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

interface InputFormProps {
  onComplete: (fields: Record<string, any>) => void;
  visible: boolean;
  onClose: () => void;
  fields: InputField[];
  title?: string;
}

const iconMap: Record<string, React.ElementType> = {
  'calendar': Calendar,
  'clock': Clock,
  'search': Search,
  'mail': Mail,
  'lock': Lock,
  'user': User,
  'phone': Phone,
  'map-pin': MapPin,
  'globe': Globe,
  'link': Link,
  'hash': Hash,
  'file-text': FileText,
  'dollar-sign': DollarSign
};

const FIELDS_PER_PAGE = 5;

export function InputForm({ onComplete, visible, onClose, fields, title = "Input Form" }: InputFormProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isClosing, setIsClosing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(fields.length / FIELDS_PER_PAGE);
  const startIndex = (currentPage - 1) * FIELDS_PER_PAGE;
  const visibleFields = fields.slice(startIndex, startIndex + FIELDS_PER_PAGE);

  useEffect(() => {
    if (visible) {
      const initialValues: Record<string, any> = {};
      const initialShowPasswords: Record<string, boolean> = {};
      
      fields.forEach(field => {
        initialValues[field.id] = '';
        if (field.type === 'password') {
          initialShowPasswords[field.id] = false;
        }
      });
      
      setValues(initialValues);
      setShowPasswords(initialShowPasswords);
      setErrors({});
      setCurrentPage(1);
    }
  }, [visible, fields]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const handleClose = () => {
    setIsClosing(true);
    fetch('https://moon-ui/closeUI', {
      method: 'POST',
    });
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.required && !values[field.id]) {
        newErrors[field.id] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Find the page with the first error
      const firstErrorField = fields.findIndex(field => newErrors[field.id]);
      const errorPage = Math.floor(firstErrorField / FIELDS_PER_PAGE) + 1;
      setCurrentPage(errorPage);
      return;
    }

    try {
      const response = await fetch('https://moon-ui/inputComplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: values })
      });

      if (response.ok) {
        onComplete(values);
        handleClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (id: string, value: any) => {
    setValues(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="w-5 h-5 text-primary/60" /> : null;
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      <div
        className={cn(
          "glass-effect w-[500px] p-8 rounded-3xl transition-all duration-500",
          isClosing && "animate-fadeOut"
        )}
      >
        <div className="flex flex-col items-center mb-8">
          <div className={cn(
            "rounded-full bg-primary/10 p-6 mb-6 relative"
          )}>
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
            <FormInput className="h-14 w-14 relative z-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          <p className="text-primary/60 mt-2">Please fill in the required information</p>
          <div className="flex items-center gap-2 mt-4">
            <p className="text-sm text-primary/60">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {visibleFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-primary"
              >
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              
              <div className="relative">
                {getIcon(field.icon) && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {getIcon(field.icon)}
                  </div>
                )}

                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    value={values[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className={cn(
                      "w-full min-h-[100px] px-4 py-3 rounded-xl transition-all",
                      "bg-primary/5 hover:bg-primary/10",
                      "text-primary placeholder:text-primary/40",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "border-2 border-primary/20",
                      field.icon && "pl-10",
                      errors[field.id] && "border-destructive/50 focus:ring-destructive/50"
                    )}
                  />
                ) : (
                  <input
                    id={field.id}
                    type={field.type === 'password' ? (showPasswords[field.id] ? 'text' : 'password') : field.type}
                    value={values[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    pattern={field.pattern}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    className={cn(
                      "w-full h-12 px-4 rounded-xl transition-all",
                      "bg-primary/5 hover:bg-primary/10",
                      "text-primary placeholder:text-primary/40",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "border-2 border-primary/20",
                      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      field.icon && "pl-10",
                      field.type === 'password' && "pr-10",
                      errors[field.id] && "border-destructive/50 focus:ring-destructive/50"
                    )}
                  />
                )}

                {field.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary"
                  >
                    {showPasswords[field.id] ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>

              {errors[field.id] && (
                <p className="text-sm text-destructive">{errors[field.id]}</p>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-primary/10">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={cn(
                "p-2 rounded-lg transition-all",
                "bg-primary/5 hover:bg-primary/10",
                "text-primary hover:text-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {currentPage === totalPages ? (
              <button
                type="submit"
                className={cn(
                  "px-6 h-10 rounded-lg transition-all",
                  "bg-primary/10 hover:bg-primary/20",
                  "text-primary hover:text-primary/90",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50"
                )}
              >
                Submit
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "p-2 rounded-lg transition-all",
                "bg-primary/5 hover:bg-primary/10",
                "text-primary hover:text-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-md hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-white/70" />
        </button>
      </div>
    </div>
  );
}

