import pathlib
import sys
import unittest
from unittest.mock import patch
sys.path.insert(0,str(pathlib.Path(__file__).parent))
import server

class MotionSourceTest(unittest.TestCase):
    def test_bundled_idle_is_too_short_for_full_posture(self):
        meta=server.inspect_motion_source(server.IDLE_VIDEO)
        if 'reason' in meta: self.skipTest('ffprobe unavailable')
        self.assertFalse(meta['suitable'])
        self.assertLess(meta['duration_seconds'],8)

    def test_requirement_rejects_missing_motion_file(self):
        with patch.object(server,'USE_MUSE',True), patch.object(server,'MUSE_DIR',pathlib.Path('/nonexistent')):
            self.assertNotEqual(server.video_diagnostic(),'ready')

if __name__=='__main__':unittest.main()
