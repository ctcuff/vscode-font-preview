import '../../scss/glyphs.scss';
import 'react-toastify/dist/ReactToastify.css';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { WorkspaceConfig } from '@font-preview/shared';
import { Glyph } from 'opentype.js';
import FontContext from '../../contexts/FontContext';
import FontNameHeader from '../FontNameHeader';
import GlyphInspectorModal from '../GlyphInspectorModal';
import Chip from '../Chip';
import GlyphItem from '../GlyphItem';
import useThemeChange from '../../hooks/use-theme-change';

type GlyphProps = {
  config: WorkspaceConfig;
};

const GLYPHS_PER_PAGE = 200;

const Glyphs = ({ config }: GlyphProps): JSX.Element => {
  const { font } = useContext(FontContext);
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedGlyph, setSelectedGlyph] = useState<Glyph | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const numPages = useMemo(
    () => Math.ceil(font.glyphs.length / GLYPHS_PER_PAGE),
    [font.glyphs.length]
  );

  const closeModal = useCallback(() => setModalOpen(false), []);

  const setButtonRow = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      element.onwheel = event => {
        event.preventDefault();
        element.scrollLeft += event.deltaY;
      };
    }
  }, []);

  const renderPageButtons = useCallback((): JSX.Element[] => {
    const elements: JSX.Element[] = [];

    for (let i = 0; i < numPages; i++) {
      let title = `${GLYPHS_PER_PAGE * i} - ${GLYPHS_PER_PAGE * (i + 1) - 1}`;

      if (i === numPages - 1) {
        title = `${GLYPHS_PER_PAGE * i} - ${font.glyphs.length - 1}`;
      }

      // Edge case: don't repeat the last index if it's the same as the first
      if (GLYPHS_PER_PAGE * i === font.glyphs.length - 1) {
        title = `${GLYPHS_PER_PAGE * i}`;
      }

      elements.push(
        <Chip
          key={i}
          selected={currentPage === i}
          title={title}
          onClick={() => setCurrentPage(i)}
        />
      );
    }

    return elements;
  }, [currentPage, setCurrentPage, font.glyphs.length, numPages]);

  const onSelectGlyph = useCallback((glyph: Glyph) => {
    setSelectedGlyph(glyph);
    setModalOpen(true);
  }, []);

  const loadGlyphs = useCallback(() => {
    const glyphList: Glyph[] = [];

    for (let i = 0; i < GLYPHS_PER_PAGE; i++) {
      const index = i + GLYPHS_PER_PAGE * currentPage;

      if (index === font.glyphs.length) {
        break;
      }

      glyphList.push(font.glyphs.get(index));
    }

    setGlyphs(glyphList);
  }, [currentPage, font.glyphs]);

  const pageButtons = useMemo(() => renderPageButtons(), [renderPageButtons]);

  const glyphComponent = useMemo(
    () =>
      glyphs.map(glyph => (
        <GlyphItem
          glyph={glyph}
          key={glyph.index}
          onClick={onSelectGlyph}
          font={font}
          config={config}
        />
      )),
    [glyphs, config, font, onSelectGlyph]
  );

  useEffect(() => {
    loadGlyphs();
  }, [loadGlyphs]);

  useThemeChange(loadGlyphs);

  return (
    <div className="glyphs">
      {selectedGlyph && (
        <GlyphInspectorModal
          onAfterOpen={() => {
            document.body.style.overflowY = 'hidden';
          }}
          onAfterClose={() => {
            document.body.style.overflowY = 'overlay';
          }}
          isOpen={isModalOpen}
          onClose={closeModal}
          glyph={selectedGlyph}
        />
      )}
      <FontNameHeader />
      {glyphs.length > 0 && numPages > 1 && (
        <div className="page-button-wrapper">
          <div className="page-button-row" ref={setButtonRow}>
            {pageButtons}
            <div className="row-spacer" />
          </div>
        </div>
      )}
      {glyphComponent}
    </div>
  );
};

export default Glyphs;
