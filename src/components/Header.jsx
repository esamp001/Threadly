import { Grid } from '@mui/material'

const Header = () => {
	return (
		<Grid container sx={{ border: '1px solid red', width: '100%', height: 150 }}>
			<Grid item xs={12} md={6}>
				LOGO
			</Grid>
			<Grid item xs={12} md={6}>
				SEARCH BAR
			</Grid>
		</Grid>
	)
}

export default Header