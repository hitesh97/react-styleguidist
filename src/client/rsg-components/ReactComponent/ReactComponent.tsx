import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Examples from 'rsg-components/Examples';
import SectionHeading from 'rsg-components/SectionHeading';
import JsDoc from 'rsg-components/JsDoc';
import Markdown from 'rsg-components/Markdown';
import Slot from 'rsg-components/Slot';
import ReactComponentRenderer from 'rsg-components/ReactComponent/ReactComponentRenderer';
import { useStyleGuideContext } from 'rsg-components/Context';
import MdxWrapper from 'rsg-components/mdx/MdxWrapper';
import MdxCode from 'rsg-components/mdx/MdxCode';
import ExamplePlaceholderDefault from 'rsg-components/ExamplePlaceholder';
import { DOCS_TAB_USAGE } from '../slots';
import { DisplayModes, UsageModes } from '../../consts';
import * as Rsg from '../../../typings';

const ExamplePlaceholder =
	process.env.STYLEGUIDIST_ENV !== 'production' ? ExamplePlaceholderDefault : () => <div />;

interface ReactComponentProps {
	component: Rsg.Component;
	depth: number;
	exampleMode?: string;
	usageMode?: string;
}

export default function ReactComponent(props: ReactComponentProps) {
	const [activeTab, setActiveTab] = useState<string | undefined>(() =>
		props.usageMode === UsageModes.expand ? DOCS_TAB_USAGE : undefined
	);

	const {
		displayMode,
		targetIndex,
		config: { pagePerSection },
	} = useStyleGuideContext();
	const { component, depth, usageMode, exampleMode } = props;
	const { name, visibleName, slug = '-', filepath, pathLine, href } = component;
	const { description = '', content, tags = {} } = component.props || {};
	const { __examples: examples = [] } = content || {};
	if (!name) {
		return null;
	}
	const showUsage = usageMode !== UsageModes.hide;

	const handleTabChange = (tabName: string) => {
		setActiveTab((currentActiveTab) => (currentActiveTab !== tabName ? tabName : undefined));
	};

	console.log('☔️ a', targetIndex, examples);

	function getExamples() {
		if (targetIndex !== undefined && examples[targetIndex]) {
			console.log('☔️ b', examples[targetIndex]);
			const example = examples[targetIndex];
			return (
				<MdxWrapper componentName={name as string} exampleMode={exampleMode} {...content}>
					<MdxCode className={`language-${example.lang}`} {...example.settings}>
						{example.content}
					</MdxCode>
				</MdxWrapper>
			);
		}

		if (content) {
			return <Examples content={content} name={name} exampleMode={exampleMode} />;
		}

		return <ExamplePlaceholder name={name} />;
	}

	return (
		<ReactComponentRenderer
			name={name}
			slug={slug}
			filepath={filepath}
			pathLine={pathLine}
			docs={<JsDoc {...tags} />}
			description={description && <Markdown text={description} />}
			heading={
				<SectionHeading
					id={slug}
					pagePerSection={pagePerSection}
					deprecated={!!tags.deprecated}
					slotName="componentToolbar"
					slotProps={{
						...component,
						isolated: displayMode !== DisplayModes.all,
					}}
					href={href}
					depth={depth}
				>
					{visibleName}
				</SectionHeading>
			}
			examples={getExamples()}
			tabButtons={
				showUsage && (
					<Slot
						name="docsTabButtons"
						active={activeTab}
						props={{ ...component, onClick: handleTabChange }}
					/>
				)
			}
			tabBody={<Slot name="docsTabs" active={activeTab} onlyActive props={component} />}
		/>
	);
}

ReactComponent.propTypes = {
	component: PropTypes.object.isRequired,
	depth: PropTypes.number.isRequired,
	exampleMode: PropTypes.string.isRequired,
	usageMode: PropTypes.string.isRequired,
};
