import '../../scss/font-preview.scss'
import React, { useMemo, useState } from 'react'
import { PreviewSample } from '@font-preview/shared/'
import FontNameHeader from '../FontNameHeader'
import Chip from '../Chip'
import sampleEN from '../../assets/sample-text/en.sample.yml'
import sampleZH from '../../assets/sample-text/zh.sample.yml'
import sampleJA from '../../assets/sample-text/ja.sample.yml'
import sampleAR from '../../assets/sample-text/ar.sample.yml'
import sampleKR from '../../assets/sample-text/kr.sample.yml'
import useLogger from '../../hooks/use-logger'

type FontPreviewProps = {
  sampleTexts: PreviewSample[]
  defaultSampleTextId: string
}

const LOG_TAG = 'FontPreview'
const sortAscending = (a: PreviewSample, b: PreviewSample) => a.id.localeCompare(b.id)

const hardCodedSamples = [sampleEN, sampleZH, sampleJA, sampleAR, sampleKR].sort(
  sortAscending
) as PreviewSample[]

const FontPreview = (props: FontPreviewProps): JSX.Element => {
  const logger = useLogger()
  const samples = useMemo(() => {
    props.sampleTexts.sort(sortAscending)
    return hardCodedSamples.concat(props.sampleTexts)
  }, [props.sampleTexts])

  const [preview, setPreview] = useState<PreviewSample>(() => {
    const { defaultSampleTextId } = props
    const sample = samples.find(s => s.id === defaultSampleTextId)

    if (!sample) {
      logger.warn(
        `Couldn't find sample with id ${defaultSampleTextId}, defaulting to English`,
        LOG_TAG
      )

      return sampleEN
    }

    return sample
  })

  return (
    <div className="font-preview">
      <FontNameHeader />
      <div className="languages">
        {samples.map(lang => (
          <Chip
            title={lang.id}
            key={lang.id}
            selected={preview.id === lang.id}
            onClick={() => setPreview(lang)}
          />
        ))}
      </div>
      <div className="text-preview" style={{ direction: preview.rtl ? 'rtl' : 'ltr' }}>
        {preview.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        {preview.source && <p className="extended-text--author">{preview.source}</p>}
      </div>
    </div>
  )
}

export default FontPreview
