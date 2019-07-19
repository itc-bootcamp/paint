
class Box extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    getClassName() {
        return `box ${this.props.color} ${this.props.selected}`
    }

    handleClick() {
        this.props.callback(this.props.color);
    }

    render() {
        return (
            <div className={this.getClassName()} onClick={this.handleClick}></div>
        );
    }
}

class Tile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: this.props.color || "white"
        };
        this.paint = this.paint.bind(this);
    }

    paint() {
        if (this.props.isDrawing) {
            this.setState({ color: this.props.color });
        }
    }

    render() {
        var color = this.state.color;
        var className = "tile " + color;
        return (
            <div className={className} onMouseMove={this.paint}
                style={{ top: this.props.y, left: this.props.x }}></div>
        );
    }
}

class PaintApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: "blue",
            isDrawing: false,
            tiles: []
        }
        this.changeColor = this.changeColor.bind(this);
        this.startDrawing = this.startDrawing.bind(this);
        this.stopDrawing = this.stopDrawing.bind(this);
        this.draw = this.draw.bind(this);
    }

    changeColor(color) {
        this.setState({
            color: color
        });
    }

    startDrawing() {
        this.setState({ isDrawing: true })
    }

    stopDrawing() {
        this.setState({ isDrawing: false })
    }

    draw(e) {
        if (this.state.isDrawing) {
            var boundaries = e.target.getBoundingClientRect();
            var left = e.pageX - boundaries.left;
            var up = e.pageY - boundaries.top;
            var tile = <Tile key={"" + left + Math.random()} color={this.state.color} x={left} y={up} />
            var newTiles = this.state.tiles.slice();
            newTiles.push(tile);
            this.setState({
                tiles: newTiles
            })
        }
    }

    render() {
        var colors = this.props.colors
            .map(color => {
                var selectedClass = this.state.color === color ? "selected" : "";
                return <Box color={color} callback={this.changeColor} selected={selectedClass} key={color}> </Box>
            });

        return (
            <div>
                <div className="content">
                    <div className="menu">
                        {colors}
                    </div>
                    <div className="board" onDragLeave={() => this.stopDrawing()} onMouseUp={this.stopDrawing}
                        onMouseDown={this.startDrawing} onMouseMove={this.draw} >
                        {this.state.tiles}
                    </div>
                </div>
            </div>
        );
    }
}


window.render = function () {
    var colors = ["green", "blue", "pink", "purple"];

    ReactDOM.render(
        <PaintApp colors={colors} />,
        document.getElementById("root")
    );
}

window.render();
