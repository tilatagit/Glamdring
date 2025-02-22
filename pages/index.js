import { Box, Pagination, Tab, Tabs, Typography } from '@mui/material';
import ProfileSelect from 'components/form/widget/ProfileSelect';
import Layout from 'components/layout/Layout';
import ProfileList from 'components/profile/ProfileList';
import { PROFILE_ORDER } from 'constants/subgraph';
import useProfile from 'hooks/useProfile';
import useToasts from 'hooks/useToasts';
import useWeb3Context from 'hooks/useWeb3Context';
import { IconUsers } from 'icons/IconUsers';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Index() {
  const router = useRouter();
  const { showToastError } = useToasts();
  const { account } = useWeb3Context();
  const [tabValue, setTabValue] = useState(PROFILE_ORDER.byPositiveRating);
  const { getProfiles } = useProfile();
  const [profiles, setProfiles] = useState(null);
  const [profilesCount, setProfilesCount] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageCount, setCurrentPageCount] = useState(1);
  const pageSize = 12;

  const handleTabChange = (_, newTabValue) => {
    setTabValue(newTabValue);
  };

  async function loadData(page = currentPage, pageCount = currentPageCount) {
    try {
      // Update states
      setCurrentPage(page);
      setCurrentPageCount(pageCount);
      setProfiles(null);
      // Load profiles
      const profiles = await getProfiles(
        null,
        null,
        pageSize,
        (page - 1) * pageSize,
        tabValue,
      );
      setProfiles(profiles);
      // Add next page to pagination if possible
      if (page == pageCount && profiles.length === pageSize) {
        setCurrentPageCount(pageCount + 1);
      }
      // Define profiles counts
      if (!profilesCount) {
        const lastProfiles = await getProfiles(
          null,
          null,
          1,
          0,
          PROFILE_ORDER.byTokenId,
        );
        setProfilesCount(
          lastProfiles && lastProfiles.length > 0
            ? lastProfiles[0].avatarNftId
            : null,
        );
      }
    } catch (error) {
      showToastError(error);
    }
  }

  useEffect(() => {
    loadData(1, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]);

  return (
    <Layout enableSidebar={!!account}>
      <Box sx={{ px: 4, mt: 12, textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom>
          Check or impact reputation of crypto people!
        </Typography>
        <Typography>
          Who was involved in the activities that made you uncomfortable?
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <ProfileSelect
          sx={{ width: { xs: 1, md: 580 } }}
          onChange={(account) => router.push(`/profile/${account}`)}
        />
      </Box>
      <Box sx={{ mt: 12 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab value={PROFILE_ORDER.byPositiveRating} label="Light Side" />
          <Tab value={PROFILE_ORDER.byNegativeRating} label="Dark Side" />
        </Tabs>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconUsers size={24} />
            <Typography variant="h3" sx={{ ml: 1 }}>
              People
            </Typography>
          </Box>
          {profilesCount && <Typography>Total: {profilesCount}</Typography>}
        </Box>
        <ProfileList profiles={profiles} sx={{ mt: 0 }} />
        <Pagination
          color="primary"
          sx={{ mt: 2 }}
          count={currentPageCount}
          page={currentPage}
          onChange={(_, page) => loadData(page)}
        />
      </Box>
    </Layout>
  );
}
