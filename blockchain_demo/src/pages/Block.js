import { Helmet } from 'react-helmet';
import {
  Box,
  Container,
  Grid
} from '@material-ui/core';
import BlockInfo from '../components/block/BlockInfo';

const Block = () => {

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
              <BlockInfo />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
};

export default Block;
