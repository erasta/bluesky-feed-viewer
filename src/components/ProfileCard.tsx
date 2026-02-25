import { linkify, fmtNum } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProfileCard({ profile }: { profile: any }) {
  return (
    <div className="profile-card">
      <div
        className="profile-banner"
        style={profile.banner ? { backgroundImage: `url('${profile.banner}')` } : undefined}
      />
      <div className="profile-body">
        {profile.avatar ? (
          <img className="profile-avatar" src={profile.avatar} alt="" />
        ) : (
          <div className="profile-avatar" />
        )}
        <div className="profile-info">
          <div className="profile-name">{profile.displayName || profile.handle}</div>
          <div className="profile-handle">@{profile.handle}</div>
          {profile.description && (
            <div className="profile-bio">{linkify(profile.description)}</div>
          )}
          <div className="profile-stats">
            <span><strong>{fmtNum(profile.followersCount)}</strong> followers</span>
            <span><strong>{fmtNum(profile.followsCount)}</strong> following</span>
            <span><strong>{fmtNum(profile.postsCount)}</strong> posts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
