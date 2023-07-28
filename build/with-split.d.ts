import type { SplitOptions } from './types'
import type { NextConfig } from 'next/dist/server/config'
declare type WithSplitArgs = {
  splits?: SplitOptions
  currentBranch?: string
  isOriginal?: boolean
  hostname?: string
}
export declare const withSplit: ({
  splits: _splits,
  ...manuals
}: WithSplitArgs) => (nextConfig: NextConfig) => NextConfig
export {}
