import {
  Avatar,
  Card,
  CardContent,
  Grid,
  Typography
} from '@material-ui/core';
import { indigo } from '@material-ui/core/colors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCubes } from '@fortawesome/free-solid-svg-icons'

const TotalBlock = (props) => (
  <Card {...props}>
    <CardContent>
      <Grid
        container
        spacing={3}
        sx={{ justifyContent: 'space-between' }}
      >
        <Grid item>
          <Typography
            color="textSecondary"
            gutterBottom
            variant="h6"
          >
            TOTAL Block
          </Typography>
          <Typography
            color="textPrimary"
            variant="h3"
          >
            {props.amount ? props.amount + " Blocks" : ''}
          </Typography>
        </Grid>
        <Grid item>
          <Avatar
            sx={{
              backgroundColor: indigo[600],
              height: 56,
              width: 56
            }}
          >
            <FontAwesomeIcon icon={faCubes} size="lg" />
          </Avatar>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default TotalBlock;
