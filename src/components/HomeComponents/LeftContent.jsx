
import { Box, Paper, Typography } from "@mui/material"
import { Ellipsis } from "lucide-react"

const LeftContent = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, backgroundColor: 'paper.backgroundColor', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'background.default' }}>
            Hot Right Now
          </Typography>

          <Ellipsis color="gray" size={20} />
        </Box>
      </Paper>
    </Box>
  )
}

export default LeftContent