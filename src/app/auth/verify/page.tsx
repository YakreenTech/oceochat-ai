'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Waves, CheckCircle, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      setStatus('success')
    } else {
      // Check if user was just created and needs verification
      const checkVerification = async () => {
        try {
          // This would normally check email verification status
          setStatus('success')
        } catch (error) {
          setStatus('error')
        }
      }
      checkVerification()
    }
  }, [user])

  const handleContinue = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h1>
          <p className="text-gray-600 dark:text-gray-300">
            We've sent you a verification link to confirm your account
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white dark:bg-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              {status === 'loading' && <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />}
              {status === 'success' && <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />}
              {status === 'error' && <Mail className="w-8 h-8 text-red-600 dark:text-red-400" />}
            </div>
            <CardTitle className="text-xl">
              {status === 'loading' && 'Sending Verification Email...'}
              {status === 'success' && 'Email Sent Successfully!'}
              {status === 'error' && 'Something went wrong'}
            </CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' && 'Please wait while we send your verification email.'}
              {status === 'success' && 'Click the link in your email to verify your account and start using OceoChat.'}
              {status === 'error' && 'Please try signing up again or contact support if the problem persists.'}
            </CardDescription>
          </CardHeader>

          {status === 'success' && (
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    What to do next:
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Check your email inbox (and spam folder)</li>
                    <li>• Click the verification link in the email</li>
                    <li>• Return here to start exploring ocean data</li>
                  </ul>
                </div>

                <Button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  Continue to OceoChat
                </Button>
              </div>
            </CardContent>
          )}

          {status === 'error' && (
            <CardContent>
              <Button
                onClick={() => router.push('/auth/signup')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Try Again
              </Button>
            </CardContent>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to OceoChat
          </Link>
        </div>
      </div>
    </div>
  )
}
