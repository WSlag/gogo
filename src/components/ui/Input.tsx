import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white text-gray-900 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        filled:
          'border-transparent bg-gray-100 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        error:
          'border-error focus:border-error focus:ring-2 focus:ring-error/20',
        success:
          'border-success focus:border-success focus:ring-2 focus:ring-success/20',
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
)

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  leftAddon?: ReactNode
  rightAddon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative flex">
          {leftAddon && (
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              {leftAddon}
            </span>
          )}

          <div className="relative flex-1">
            {leftIcon && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {leftIcon}
              </span>
            )}

            <input
              type={type}
              id={inputId}
              className={cn(
                inputVariants({
                  variant: error ? 'error' : variant,
                  inputSize,
                }),
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                leftAddon && 'rounded-l-none',
                rightAddon && 'rounded-r-none',
                className
              )}
              ref={ref}
              {...props}
            />

            {rightIcon && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {rightIcon}
              </span>
            )}
          </div>

          {rightAddon && (
            <span className="inline-flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              {rightAddon}
            </span>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}

        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Phone Input for Philippine numbers
export interface PhoneInputProps extends Omit<InputProps, 'type' | 'leftAddon'> {}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="tel"
        leftAddon="+63"
        placeholder="9XX XXX XXXX"
        maxLength={10}
        {...props}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export { Input, PhoneInput, inputVariants }
