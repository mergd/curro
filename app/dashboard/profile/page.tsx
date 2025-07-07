import { UserProfileForm } from "@/components/profile/user-profile-form";

export default function ProfilePage() {
  return (
    <div className="space-y-6 mt-12 max-w-3xl mx-auto">
      <div>
        <h3 className="text-lg font-medium">Your Profile</h3>
        <p className="text-sm text-muted-foreground">
          Update your profile information.
        </p>
      </div>
      <UserProfileForm />
    </div>
  );
}
