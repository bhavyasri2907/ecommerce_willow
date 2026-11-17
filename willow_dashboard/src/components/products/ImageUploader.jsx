import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Link2, Loader2, Trash2 } from 'lucide-react';
import { productService } from '../../services/productService.js';
import { isHttpUrl } from '../../utils/validators.js';
import { MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_TYPES } from '../../constants/productOptions.js';

/**
 * Product photos: drop or pick files (uploaded straight away), or add one by link.
 * `images` is the ordered list of URLs; the first is the cover shown in listings.
 */
export default function ImageUploader({ images, onChange, error }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(0); // files still being sent
  const [dragOver, setDragOver] = useState(false);
  const [problem, setProblem] = useState('');
  const [link, setLink] = useState('');

  const room = MAX_PHOTOS - images.length;

  async function addFiles(fileList) {
    setProblem('');
    const files = [...fileList];
    const accepted = files
      .filter((f) => PHOTO_TYPES.includes(f.type) && f.size <= MAX_PHOTO_BYTES)
      .slice(0, Math.max(room, 0));
    if (accepted.length < files.length) {
      setProblem(
        files.length > room && room <= accepted.length
          ? `A product can have up to ${MAX_PHOTOS} photos.`
          : 'Some files were skipped: photos must be JPG, PNG or WebP, up to 5 MB each.'
      );
    }
    if (!accepted.length) return;

    setUploading(accepted.length);
    let next = images;
    for (const file of accepted) {
      try {
        const { url } = await productService.uploadImage(file);
        next = [...next, url];
        onChange(next);
      } catch (err) {
        setProblem(`${file.name}: ${err.message}`);
      }
      setUploading((n) => n - 1);
    }
  }

  function addLink() {
    const url = link.trim();
    if (!url) return;
    if (!isHttpUrl(url)) return setProblem('A photo link must start with http:// or https://');
    if (images.includes(url)) return setProblem('That photo is already added.');
    if (room <= 0) return setProblem(`A product can have up to ${MAX_PHOTOS} photos.`);
    setProblem('');
    onChange([...images, url]);
    setLink('');
  }

  function move(index, by) {
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    onChange(next);
  }

  return (
    <div className="uploader">
      <div className="uploader__grid">
        {images.map((url, i) => (
          <figure key={url} className="uploader__tile">
            <img src={url} alt={`Photo ${i + 1}`} />
            {i === 0 && <figcaption className="uploader__cover">Cover</figcaption>}
            <div className="uploader__actions">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">
                <ChevronLeft size={14} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Move later">
                <ChevronRight size={14} />
              </button>
              <button type="button" onClick={() => onChange(images.filter((u) => u !== url))} aria-label="Remove photo">
                <Trash2 size={14} />
              </button>
            </div>
          </figure>
        ))}

        {room > 0 && (
          <button
            type="button"
            className={`uploader__drop ${dragOver ? 'is-over' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            disabled={uploading > 0}
          >
            {uploading > 0 ? <Loader2 size={20} className="spin" aria-hidden /> : <ImagePlus size={20} aria-hidden />}
            <strong>{uploading > 0 ? `Uploading ${uploading}…` : images.length ? 'Add photo' : 'Add photos'}</strong>
            <span>Drop here or click to browse</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_TYPES.join(',')}
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = ''; // let the same file be picked again
        }}
      />

      <div className="uploader__link">
        <Link2 size={15} aria-hidden />
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addLink();
            }
          }}
          placeholder="Or paste a photo link"
          aria-label="Photo link"
        />
        <button type="button" onClick={addLink} disabled={!link.trim()}>Add</button>
      </div>

      {problem || error ? (
        <p className="field__error" role="alert">{problem || error}</p>
      ) : (
        <p className="field__hint">
          {images.length
            ? `${images.length} of ${MAX_PHOTOS} photos. The first one is the cover; use the arrows to reorder.`
            : `JPG, PNG or WebP, up to 5 MB each, ${MAX_PHOTOS} photos at most. Square photos look best.`}
        </p>
      )}
    </div>
  );
}
