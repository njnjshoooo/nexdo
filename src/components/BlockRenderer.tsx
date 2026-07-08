import React from 'react';
import { GeneralBlock } from '../types/admin';
import Markdown from 'react-markdown';
import { motion } from 'framer-motion';

//... wait, it will be huge. Maybe I can just move SubItemPage's specific block types into GeneralPage's switch case? No, GeneralPage wraps blocks in full width, SubItemPage puts them in the main column.
