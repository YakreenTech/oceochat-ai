"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Waves, MessageCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface SignupPromptProps {
  open: boolean
  onClose: () => void
  remainingChats: number
}

export function SignupPrompt({ open, onClose, remainingChats }: SignupPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#202123] border-[#2a2b32] text-gray-100">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            Continue Your Ocean Research
          </DialogTitle>
          <DialogDescription className="text-gray-300 mt-2">
            You've used your free chat limit. Sign up to continue exploring the ocean with unlimited access to OceoChat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span>Unlimited ocean research conversations</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Access to ARGO floats, NOAA, and NASA data</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Waves className="w-4 h-4 text-blue-500" />
              <span>Save and export your research findings</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-4">
            <Link href="/auth/sign-up" className="w-full">
              <Button className="w-full bg-white text-black hover:bg-white/90 font-medium">
                Sign up for free
              </Button>
            </Link>
            <Link href="/auth/sign-in" className="w-full">
              <Button variant="outline" className="w-full border-[#2a2b32] text-gray-100 hover:bg-[#2a2b32]">
                Already have an account? Sign in
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-[#2a2b32]">
            <p className="text-xs text-gray-400">
              Free forever • No credit card required
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
