import * as React from "react"

export const Alert: React.FC<React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'destructive' }> = ({ children, ...props }) => (
  <div role="alert" {...props}>{children}</div>
)

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
)
