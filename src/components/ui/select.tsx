import * as React from "react"

export const Select: React.FC<{ defaultValue?: string; children: React.ReactNode }> = ({ children }) => <div>{children}</div>
export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => <div {...props}>{children}</div>
export const SelectValue: React.FC = () => null
export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => <div {...props}>{children}</div>
export const SelectItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({ children, ...props }) => <div {...props}>{children}</div>
