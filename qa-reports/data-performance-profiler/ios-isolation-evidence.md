# iOS isolation evidence

The native command supplied `APP_ENV=development`, enabled local Design-QA mode, used an invalid local Supabase URL sentinel, and supplied non-production RevenueCat sentinels. The existing `.env.local` was not edited or printed. No real user, production endpoint, purchase, analytics destination, or cloud record was accessed. The command stopped in CocoaPods before an app launch, so isolation was established at configuration level but not runtime-exercised.
