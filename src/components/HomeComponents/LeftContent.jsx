
import { Avatar, Box, Paper, Typography } from "@mui/material"
import { Ellipsis } from "lucide-react"

const LeftContent = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, backgroundColor: 'paper.backgroundColor', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700 }}>
            Hot Right Now
          </Typography>

          <Ellipsis color="gray" size={20} />
        </Box>

        {/* Content of left side */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ height: 35, width: 35, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
          {/* Space */}
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'capitalize' }}>
            spaces
          </Typography>
        </Box>
      </Paper>

      {/* Content of left side - Trending Spaces */}
      <Paper sx={{ p: 2, backgroundColor: 'paper.backgroundColor', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700 }}>
            Trending Spaces
          </Typography>


          <Ellipsis color="gray" size={20} />
        </Box>

        {/* Content of left side - Spaces */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Image Container using box */}
          <Box sx={{
            height: 150,
            width: 150,
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            border: '1px solid red'
          }}>
            <Box
              sx={{
                bgcolor: 'gray',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                p: 1
              }}
            >
              Space Title
            </Box>

          </Box>
          <Box sx={{
            height: 150,
            width: 150,
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            border: '1px solid red'
          }}>
            <Box
              sx={{
                bgcolor: 'gray',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                p: 1
              }}
            >
              Space Title
            </Box>

          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default LeftContent