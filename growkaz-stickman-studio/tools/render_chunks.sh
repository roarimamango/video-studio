#!/bin/bash
# Resumable chunked render: tools/render_chunks.sh <project-dir> [chunk_frames]
# Renders build/segments/fNNNNN.mp4 per chunk (skips finished, valid chunks), then joins them into build/video_silent.mp4.
set -u
cd "$(dirname "$0")/.."
PROJ=$1; CH=${2:-960}
FPS=$(python3 -c "import json;print(json.load(open('$PROJ/config.json')).get('fps',24))")
TOTAL=$(python3 -c "import json,math;d=json.load(open('$PROJ/story/shots.json'));print(math.ceil(d['duration']*$FPS))")
SEG=$PROJ/build/segments; mkdir -p $SEG; : > $SEG/list.txt
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH)); [ $b -gt $TOTAL ] && b=$TOTAL; out=$SEG/f$(printf %05d $a).mp4
  echo "file '$PWD/$out'" >> $SEG/list.txt
  if ffprobe -v error -show_entries format=duration -of csv=p=0 "$out" >/dev/null 2>&1; then echo "skip $a-$b"; continue; fi
  echo "render $a-$b of $TOTAL"
  node render.mjs --project $PROJ --from $(python3 -c "print($a/$FPS)") --to $(python3 -c "print($b/$FPS)") --workers 3 --format jpeg --out "$out.tmp.mp4" > $PROJ/build/render_chunk.log 2>&1 && mv "$out.tmp.mp4" "$out" && echo "done $a-$b" || { echo "FAILED $a-$b"; tail -3 $PROJ/build/render_chunk.log; exit 1; }
done
ffmpeg -y -loglevel error -f concat -safe 0 -i $SEG/list.txt -c copy -movflags +faststart $PROJ/build/video_silent.mp4 && echo "JOINED $(ffprobe -v error -show_entries format=duration -of csv=p=0 $PROJ/build/video_silent.mp4)s" && echo ALL_CHUNKS_FINISHED
