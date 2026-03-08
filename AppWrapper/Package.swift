// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "GMCApp",
    platforms: [
        .macOS(.v13)
    ],
    targets: [
        .executableTarget(
            name: "GMCApp",
            dependencies: [],
            path: "Sources/GMCApp"
        )
    ]
)
