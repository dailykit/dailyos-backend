export const handleRewards = async (req, res, next) => {
   try {
      res.json({ success: true, message: 'Rewards given!' })
   } catch (err) {
      next(err)
   }
}
