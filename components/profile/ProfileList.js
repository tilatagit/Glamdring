import { Grid, Typography } from '@mui/material';
import ProfileCard from 'components/profile/ProfileCard';

/**
 * A component with a list of profiles.
 */
export default function ProfileList({ profiles, sx }) {
  return (
    <Grid container spacing={3} sx={{ ...sx }}>
      {!profiles && (
        <>
          {Array(3)
            .fill()
            .map((_, index) => (
              <Grid key={index} item xs={12} md={6}>
                <ProfileCard />
              </Grid>
            ))}
        </>
      )}
      {profiles && profiles.length === 0 && (
        <Grid item xs={12} md={4}>
          <Typography>None</Typography>
        </Grid>
      )}
      {profiles && profiles.length > 0 && (
        <>
          {profiles.map(
            (profile, index) =>
              profile && (
                <Grid key={index} item xs={12} md={6}>
                  <ProfileCard profile={profile} />
                </Grid>
              ),
          )}
        </>
      )}
    </Grid>
  );
}
