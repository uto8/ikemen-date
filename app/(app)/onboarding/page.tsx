import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import FemaleOnboardingForm from '@/components/profile/FemaleOnboardingForm'
import MaleOnboardingForm from '@/components/profile/MaleOnboardingForm'

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // layout.tsx でセッション保護済みだが型上 null の可能性があるため
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('gender, is_onboarding_complete')
    .eq('id', user.id)
    .single()

  if (profile?.is_onboarding_complete) redirect('/users')

  const gender = profile?.gender ?? (user.user_metadata.gender as string)

  return gender === 'female' ? <FemaleOnboardingForm /> : <MaleOnboardingForm />
}
