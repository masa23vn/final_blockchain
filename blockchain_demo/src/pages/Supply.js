import { Helmet } from 'react-helmet';
import {
  Box,
  Container,
  Grid
} from '@material-ui/core';
import SupplyInfo from '../components/supply/SupplyInfo';

const Supply = () => {
  const supplyLength = 5;
  const txLength = 10
  return (
    <>
      <Helmet>
        <title>Dashboard | Material Kit</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3
        }}
      >
        <Container maxWidth={false}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
            >
              <SupplyInfo />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
};

export default Supply;
